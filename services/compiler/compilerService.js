import solc from "solc";
import { TemplateSM } from "./templateSmartContract";
export const CompilerService = {};

CompilerService.compile = (smartContract, params) => {
  //Aqui compila el codigo

  // Configuración del compilador
  const input = {
    language: "Solidity",
    sources: {
      "MyContract.sol": {
        content: smartContractReady, // Código del contrato como string
      },
    },
    settings: {
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode"], // Lo que queremos que compile
        },
      },
    },
  };
  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  return output.contracts["MyContract.sol"].MyContract.evm.bytecode.object;
};
CompilerService._encodeHex = (bytecode) => {};
