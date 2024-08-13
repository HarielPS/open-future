// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract GaltoxTest{

    address payable public dir_owner;
    address payable public dir_empresa;
    uint256 public monto_meta; //En wei
    uint256 public monto_recaudado;
    uint256 public monto_ingresado_empresa; //El dinero que ingresa la empresa para pagar a los que le prestaron
    uint256 public monto_ingresado_empresa_garantia; //El dinero que ingresa la empresa para poner como garantia
    uint256 public num_mensualidades;
    uint256 public fecha_lapso = 3 days;
    uint256 public fecha_fin_recaudacion; //Pasada esta fecha ningun usuario podra depositar
    uint256 public fecha_fin_prestamo; //Es el tiempo que dura el prestamo (y durante este periodo se tiene que pagar)
    uint256 public fecha_deadline; //Pasada esta fecha se regresa el dinero (si es que no se llego a la meta y la empresa no acepta el dinero).
    uint256 public fecha_fin_recaudacion_garantia;
    uint256 public fecha_lastPayment;
    uint256 public monto_extra_empresa;
    uint256 public porcentaje_comision;
    bool public meta_alcanzada;
    bool public garantia_completada;
    bool public aceptar_dinero_recaudado;
    bool public fondos_distribuidos_empresa;  //El dinero del smartContract se le transfirio a la empresa
    bool public reembolsar_a_empresa;
    bool public retribucion_completada;
    bool public HaIncumplido;

    //Definimos estructura del usuario
    struct Contribucion {
        address payable contribuidor_ethereum;
        uint256 amount;
        string contribuidor_bitcoin;
        bool isBitcoinWallet;
    }

    Contribucion[] public contribuidores;
    mapping(address => uint256) public MontoContribuidores;

    //Falta definir los eventos que indican que se hizo una accion

    //Funcion para validar que solo el owner tiene privilegios
    modifier OnlyOwner() {
        require(msg.sender == dir_owner, "Solo el owner puede hacer esta accion");
        _;
    }
    //Funcion para validar que solo la empresa tiene privilegios
    modifier OnlyCompany() {
        require(msg.sender == dir_empresa, "Solo la empresa puede hacer esta accion");
        _;
    }

    constructor(
        address payable _dir_owner,
        address payable _dir_empresa,
        uint256 _monto_meta,
        uint256 _fecha_fin_recaudacion,
        uint256 _fecha_fin_prestamo,
        uint256 _num_mensualidades,
        uint256 _porcentaje_comision
    ){
        dir_owner = _dir_owner;
        dir_empresa = _dir_empresa;
        monto_meta = _monto_meta;
        fecha_fin_recaudacion_garantia = block.timestamp + 1 days;
        fecha_fin_recaudacion = _fecha_fin_recaudacion + fecha_fin_recaudacion_garantia;
        fecha_fin_prestamo = _fecha_fin_prestamo; //Dias de prestamo
        fecha_lastPayment = 0;
        num_mensualidades = _num_mensualidades;
        porcentaje_comision = _porcentaje_comision;
        monto_recaudado = 0;
        monto_ingresado_empresa = 0; //El dinero que ingresa la empresa para pagar a los que le prestaron
        monto_ingresado_empresa_garantia = 0; //El dinero que ingresa la empresa para poner como garantia
        monto_extra_empresa = 0;
        meta_alcanzada = false;
        garantia_completada = false;
        aceptar_dinero_recaudado = false;
        fondos_distribuidos_empresa = false;  //El dinero del smartContract se le transfirio a la empresa
        reembolsar_a_empresa = false;
        retribucion_completada = false;
        HaIncumplido = false;
    }
    /*
    -Verificar la fecha de ingreso de garantia
    */
    function DepositarGarantia()  public payable OnlyCompany {
        require(block.timestamp < fecha_fin_recaudacion_garantia, "Ya paso la fecha de recaudacion de garantia");
        uint256 cpy_monto_ingresado_empresa_garantia = monto_ingresado_empresa_garantia;
        require(!garantia_completada,"Ya se ingreso la garantia");
        require(msg.value > 0, "Debes depositar una cantidad mayor a 0");
        monto_ingresado_empresa_garantia += msg.value;
        if(monto_ingresado_empresa_garantia >= monto_meta){
            garantia_completada = true;
            if(monto_ingresado_empresa_garantia > monto_meta){
                monto_extra_empresa = monto_ingresado_empresa_garantia - monto_meta;
            }
        }
    }
    /*
    -Verificar esta funcion, a ver si esta correcta
    -Verificar que todos los parametros enviados son los correctos
    */
    function Invertir() public payable {
        require(garantia_completada, "Espera a que al empresa ingrese la garantia");
        require(block.timestamp < fecha_fin_recaudacion, "El tiempo de invertir ha expirado");
        require(!meta_alcanzada, "Ya se ha recolectado la meta establecida, No puedes depositar mas");
        require(msg.value > 0, "El monto ingresado debe ser mayor a 0");
        uint256 nuevoMonto = MontoContribuidores[msg.sender] + msg.value;
        uint256 cpy_monto_recaudado = monto_recaudado;

        //Verificar si la nueva contribucion supera la meta
        if(cpy_monto_recaudado + msg.value > monto_meta){
            uint256 exceso = cpy_monto_recaudado + msg.value - monto_meta;
            nuevoMonto = monto_meta - cpy_monto_recaudado;//
            payable(msg.sender).transfer(exceso);//
        } else{
            nuevoMonto = msg.value;
        }
        //Actualizar montos
        MontoContribuidores[msg.sender] += nuevoMonto;
        monto_recaudado += nuevoMonto;

        //Verificar si el contribuidor ya existe en la lista
        bool existe = false;
        for(uint256 i = 0; i < contribuidores.length;i++){
            if(contribuidores[i].contribuidor_ethereum == msg.sender){
                contribuidores[i].amount += nuevoMonto;
                existe = true;
                break;
            }
        }
        if(!existe){
            contribuidores.push(Contribucion(payable(msg.sender), nuevoMonto,"cuentaB",false));
        }
        //Emitimos mensaje?

        //Verificamos si se alcanzo la meta
        if(monto_recaudado >= monto_meta){
            meta_alcanzada = true;
            //Emitimos mensaje?
        }
    }
    function AceptarDineroRecaudado() public OnlyCompany{
        aceptar_dinero_recaudado = true;
    }

    function RetirarFondosEmpresa() public OnlyCompany{ //Dinero del smart contract a la ==> Empresa
        uint256 currentTime  =block.timestamp;
        require(garantia_completada, "Primero debes completar el monto de garantia");
        require(!fondos_distribuidos_empresa, "Ya se le ha transferido fondos a la empresa, no se puede realizar esta accion mas de 1 vez");
        //fecha entre fin recaudacion y mas 5 dias
        if(currentTime > fecha_fin_recaudacion + fecha_lapso){
            //Ya no puedes retirar fondos
            Reembolso();
        }
        if(meta_alcanzada){
            payable(dir_empresa).transfer(monto_recaudado);
            fondos_distribuidos_empresa = true;
            //Fecha
            fecha_fin_prestamo += currentTime; 
            fecha_lastPayment = currentTime + 30 days;
            //Emitir mensaje?
        }else{
            require(aceptar_dinero_recaudado, "Primero tienes que aceptar el monto recolectado");
            payable (dir_empresa).transfer(monto_recaudado);
            fondos_distribuidos_empresa = true;
            fecha_fin_prestamo += currentTime; 
            fecha_lastPayment = currentTime + 30 days;
            //Emitir mensaje?
        }
        //Regresamos el dinero extra de la garantia
        payable(dir_empresa).transfer(monto_extra_empresa);
    } 

    /*La funcion valida que el monto ingresado sea correcto en todos los aspectos (cantidad, fecha, etc)
    -fecha valida??, si no hacer reembolso?
    */
    function DepositarMensualidad() payable public {
        require(!HaIncumplido, "Haz incumplido, no puedes participar mas");
        uint256 currentTime = block.timestamp;
        uint256 monto_min_ingresado = (monto_recaudado * porcentaje_comision) / 100;//Aqui la formula para el total que tiene que ingresar para la primera mensualidad
        require(!fondos_distribuidos_empresa, "Primero debes retirar los fondos");
        require(num_mensualidades > 0,"Ya has terminado de pagar tus mensualidades");
        require(msg.value > 0, "El monto ingresado debe ser mayor que cero");
        //Validamos la fecha, si no hacemos un reembolso.
        if(currentTime >=fecha_lastPayment  && currentTime > fecha_lastPayment+5 days){
            Reembolso();
            _TransferirInversionYGarantia();
            HaIncumplido = true;
        }
        monto_ingresado_empresa += msg.value;
        if(monto_ingresado_empresa>= monto_min_ingresado){//El dinero acumulado ya es el minimo para poder hacer el pago de la primera mensualidad
            TransferirMensualidad();
            num_mensualidades--;
            if(num_mensualidades >1){
                //Regresamos todo el dinero a la empresa y a las personas, porque ya acabo el prestamo
                _TransferirInversionYGarantia();
                if(monto_ingresado_empresa > monto_min_ingresado){
                    monto_extra_empresa = monto_ingresado_empresa - monto_min_ingresado;
                    dir_empresa.transfer(monto_extra_empresa);
                }
            }
        }
    }

    function _TransferirInversionYGarantia() private {
        dir_empresa.transfer(monto_ingresado_empresa_garantia);
        monto_ingresado_empresa_garantia =0;
        //Regresamos la inversion inicial a cada persona
        for(uint256 i =0; i< contribuidores.length; i++){
            if(contribuidores[i].isBitcoinWallet){
                _TransferOnBitcoin(contribuidores[i].contribuidor_bitcoin,contribuidores[i].amount);
            }else{
                _TransferOnEthereum(contribuidores[i].contribuidor_ethereum,contribuidores[i].amount);
            }
        }
    } 

    function _TransferOnEthereum(address payable dir_cuenta, uint256 amount) private{
        dir_cuenta.transfer(amount);
    }
    function _TransferOnBitcoin(string memory dir_cuenta, uint256 amout) private {
        //Logic to transfer using zetachain
    }

    /*
    -Verificar las fechas
    */
    function TransferirMensualidad() private  {
        uint256 max_amount_invesment = (monto_recaudado * porcentaje_comision)/100;
        uint256 amoutToTransfer = 0;
        for(uint256 i =0; i <contribuidores.length; i++){
            amoutToTransfer = ((contribuidores[i].amount/ monto_recaudado)* max_amount_invesment)/12;
            if(contribuidores[i].isBitcoinWallet){
                _TransferOnBitcoin(contribuidores[i].contribuidor_bitcoin,amoutToTransfer);
            }else{
                _TransferOnEthereum(contribuidores[i].contribuidor_ethereum,amoutToTransfer);
            }
        }
    }

    function _Reembolso() private {
        uint256 currentTime = block.timestamp;
        for(uint256 i=0;i < contribuidores.length;i++){
            if(contribuidores[i].isBitcoinWallet){
                _TransferOnBitcoin(contribuidores[i].contribuidor_bitcoin,contribuidores[i].amount);
            }else{
                _TransferOnEthereum(contribuidores[i].contribuidor_ethereum,contribuidores[i].amount);
            }
        }
        //Return the money to the company
        uint256 total_money_company = monto_ingresado_empresa_garantia + monto_extra_empresa+ monto_ingresado_empresa;
        monto_extra_empresa =0;
        monto_ingresado_empresa =0;
        monto_ingresado_empresa_garantia =0;
        delete contribuidores;
    }
    /*
    -Verificar la fecha que si passa de 5 dias despues de su dia de pago
    -verificar que si se puede hacer reembolso
    */
    function Reembolso() public {
        require(block.timestamp > fecha_fin_prestamo,"ya no puedes hacer reembolso");
        uint256 currentTime = block.timestamp;
        if(currentTime > fecha_fin_recaudacion_garantia && !garantia_completada){
            for(uint256 i=0;i < contribuidores.length;i++){
                if(contribuidores[i].isBitcoinWallet){
                    _TransferOnBitcoin(contribuidores[i].contribuidor_bitcoin,contribuidores[i].amount);
                }else{
                    _TransferOnEthereum(contribuidores[i].contribuidor_ethereum,contribuidores[i].amount);
                }
            }
            //Return the money to the company
            uint256 total_money_company = monto_ingresado_empresa_garantia + monto_extra_empresa+ monto_ingresado_empresa;
            monto_extra_empresa =0;
            monto_ingresado_empresa =0;
            monto_ingresado_empresa_garantia =0;
            delete contribuidores;
        }
    }
    function getBalance() public view returns (uint256){
        return address(this).balance;
    }
    function getGarantia() public view returns (uint256){
        return monto_ingresado_empresa_garantia;
    }
    function getRecaudacion() public view returns (uint256){
        return  monto_recaudado;
    }
}