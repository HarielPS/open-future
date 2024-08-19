export const Prompt={
    PrompAnaliceSignupCompany : "En base al análisis de un balance general de una empresa, ¿podrías ayudarme a determinar si esta empresa es una buena candidata para recibir un crédito? Estoy interesado en evaluar su capacidad de pago, nivel de endeudamiento, y cualquier otro indicador financiero relevante que me permita decidir si debería incluir a esta empresa en mi cartera de clientes como institución financiera que otorga créditos, quiero que tu respuesta sea de formato JSON en el cual haya un campo que se llame 'empresa_aprobada' el cual sera false o true si es que esta empresa puede ser parte de mi billetera de clientes",
    PrompNewProjectCompany : "Con base en la información proporcionada por una empresa sobre un proyecto en el cual está trabajando, ¿podrías ayudarme a determinar cuánto sería el monto máximo de crédito que le puedo ofrecer? Además, ¿cuál sería una comisión razonable por el préstamo y cuánto debería solicitar como garantía? La empresa me ha indicado el monto que necesita y el plazo en meses en el que planea realizar el pago, quiero que tu respuesta tenga los campos 'credito_aprobado' el cual es true o false para indicar si el credito se aprobo o no, 'monto_aprobado' el cual indica la cantidad de dinero que se le puede otorgar, 'comision_aprobada' la cual indicara cual es la comision que se le cobrara a la persona sobre el monto que se le otorgo de prestamo, 'plazo_aprobado' el cual indica cuantos meses tiene la empresa para pagar el prestamo, 'garantia_aprobada' el cual indica que cantidad de dinero debe primero depositar la empresa a nosotros para que nosotros le demos un prestamo."}; 