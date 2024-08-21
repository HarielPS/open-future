const GAS_LIMIT = 800000;

import {
  ContractExecuteTransaction,
  ContractFunctionParameters,
  ContractInfoQuery,
  AccountId,
  Client,
  ContractCallQuery,
  ContractCreateTransaction,
} from "@hashgraph/sdk";
import { CompilerService } from "../compiler/compilerService";

export const Hedera = {};

const operatorId = AccountId.fromString(process.env.OPERATOR_ID); //Revisar esto
const operatorKey = PrivateKey.fromString(process.env.OPERATOR_PVKEY); //Revisar esto
const client = Client.forTestnet().setOperator(operatorId, operatorKey); //Revisar esto

Hedera.DepositarGarantia = async (cId, dir_company, amountHbar) => {
  //cId contract ID
  //payable
  //const tokenId = process.env.MY_ACCOUNT_ID;
  const Params = new ContractFunctionParameters().addAddress(dir_company); // pasamos dir_company para hacer validaciones
  const contractExecuteTx = new ContractExecuteTransaction()
    .setContractId(cId)
    .setGas(GAS_LIMIT)
    .setFunction("DepositarGarantia", Params)
    .setPayableAmount(amountHbar * 1e-8);
  const contractExecuteSubmit = await contractExecuteTx.execute(client);
  const contractExecuteRx = await contractExecuteSubmit.getReceipt(client);
  return contractExecuteRx;
};

Hedera.Invertir = async (cId, dir_contribuidor, amountHbar) => {
  //payable
  //const tokenId = process.env.MY_ACCOUNT_ID;
  const Params = new ContractFunctionParameters().addAddress(dir_contribuidor);
  const contractExecuteTx = new ContractExecuteTransaction()
    .setContractId(cId)
    .setGas(GAS_LIMIT)
    .setFunction("DepositarGarantia", Params)
    .setPayableAmount(amountHbar * 1e-8);
  const contractExecuteSubmit = await contractExecuteTx.execute(client);
  const contractExecuteRx = await contractExecuteSubmit.getReceipt(client);
  return contractExecuteRx;
};

Hedera.AceptarDineroRecaudado = async () => {
  const Params = [];
  const contractExecuteTx = new ContractExecuteTransaction()
    .setContractId(cId)
    .setGas(GAS_LIMIT)
    .setFunction("AceptarDineroRecaudado", Params);
  const contractExecuteSubmit = await contractExecuteTx.execute(client);
  const contractExecuteRx = await contractExecuteSubmit.getReceipt(client);
  return contractExecuteRx;
};

Hedera.RetirarFondosEmpresa = async (cId, dir_company) => {
  const Params = new ContractFunctionParameters().addAddress(dir_company);
  const contractExecuteTx = new ContractExecuteTransaction()
    .setContractId(cId)
    .setGas(GAS_LIMIT)
    .setFunction("RetirarFondosEmpresa", Params);
  const contractExecuteSubmit = await contractExecuteTx.execute(client);
  const contractExecuteRx = await contractExecuteSubmit.getReceipt(client);
  return contractExecuteRx;
};

Hedera.DepositarMensualidad = async (cId, dir_company, amountHbar) => {
  //payable
  //const tokenId = process.env.MY_ACCOUNT_ID;
  const Params = new ContractFunctionParameters().addAddress(dir_company);
  const contractExecuteTx = new ContractExecuteTransaction()
    .setContractId(cId)
    .setGas(GAS_LIMIT)
    .setFunction("DepositarGarantia", Params)
    .setPayableAmount(amountHbar * 1e-8);
  const contractExecuteSubmit = await contractExecuteTx.execute(client);
  const contractExecuteRx = await contractExecuteSubmit.getReceipt(client);
  return contractExecuteRx;
};

Hedera.Reembolso = async (cId, dir_company) => {
  const Params = new ContractFunctionParameters().addAddress(dir_company);
  const contractExecuteTx = new ContractExecuteTransaction()
    .setContractId(cId)
    .setGas(GAS_LIMIT)
    .setFunction("Reembolso", Params);
  const contractExecuteSubmit = await contractExecuteTx.execute(client);
  const contractExecuteRx = await contractExecuteSubmit.getReceipt(client);
  return contractExecuteRx;
};

Hedera.getBalance = async (cId) => {
  const info = await new ContractInfoQuery().setContractId(cId).execute(client);
  return info.balance;
};

Hedera.getGarantia = async (cId) => {
  const gasLim = 8000;
  const contractQueryTx = new ContractCallQuery()
    .setContractId(cId)
    .setGas(gasLim)
    .setFunction("getGarantia");
  const contractQuerySubmit = await contractQueryTx.execute(client);
  const contractQueryResult = contractQuerySubmit.getUint256(0);
  return contractQueryResult * 1e-8;
};

Hedera.DeploySmartContract = async () => {
   //Compile Smart contract
   const htsContract = CompilerService.compile(); 

  const bytecode = htsContract.data.bytecode.object;
  //Create a file on Hedera and store the hex-encoded bytecode
  const fileCreateTx = new FileCreateTransaction().setContents(bytecode);
  //Submit the file to the Hedera test network signing with the transaction fee payer key specified with the client
  const submitTx = await fileCreateTx.execute(client);
  //Get the receipt of the file create transaction
  const fileReceipt = await submitTx.getReceipt(client);
  //Get the file ID from the receipt
  const bytecodeFileId = fileReceipt.fileId;
  //Log the file ID
  console.log("The smart contract bytecode file ID is " + bytecodeFileId);
  //Deploy the contract instance
  const contractTx = await new ContractCreateTransaction()
    //The bytecode file ID
    .setBytecodeFileId(bytecodeFileId)
    //The max gas to reserve
    .setGas(2000000);

  //Submit the transaction to the Hedera test network
  const contractResponse = await contractTx.execute(client);
  //Get the receipt of the file create transaction
  const contracReceipt = await contractResponse.getReceipt(client);
  //Get the smart contract ID
  const newContractId = contractReceipt.contractId;
  //Log the smart contract ID
  console.log("The smart contract ID is " + newContractId);

  return {bytecodeFileId,newContractId}
};

Hedera.EVMToIdAddress = async (evmAddress) => {
  const url = `https://mainnet-public.mirrornode.hedera.com/api/v1/contracts/${evmAddress}`;
  fetch(url)
    .then((response) => response.json())
    .then((data) => console.log(data.contract_id));
};
