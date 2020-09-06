const compileSrvAddr = "http://sol0425Srv.xchainunion.com";
const chainName = 'oexchain';
const userFilePath = "/solidity/";
const libFilePath = "/libsList/?" + chainName;
const sampleFilePath = "/sampleCodeList/?" + chainName;
let userFileAddr = compileSrvAddr + userFilePath;
let libFileAddr = compileSrvAddr + libFilePath;
let sampleFileAddr = compileSrvAddr + sampleFilePath;

const  OpSolType = {
	AddSol: 0,
	DelSol :  1,
	UpdateSol :  2,
	ListSol :  3,
	RenameSol :  4,
	CompileSol :  5,
	ListSharedAccount :  6,
	GetSharedSol :  7,
}

export function changeSrv(compileSrv) {
  userFileAddr = compileSrv + userFilePath;
  libFileAddr = compileSrv + libFilePath;
  sampleFileAddr = compileSrv + sampleFilePath;
}

export async function getLibSolFile() {
  let resp = await fetch(libFileAddr, {});
  resp = await resp.json();
  return resp;
}

export async function getSampleSolFile() {
  let resp = await fetch(sampleFileAddr, {});
  resp = await resp.json();
  return resp;
}

export function addSol(accountName, solFileName) {
  const dataToSrv = JSON.stringify({ type: OpSolType.AddSol,
    chainName,
    accountName: accountName,
    sharedAccountName: '',
    solFileName: solFileName,
    newSolFileName: "",
    solFileContent: ""});
  fetch(userFileAddr, 
        {headers: { "Content-Type": "application/json" }, method: 'POST', body: dataToSrv})
  .then(resp => {
          resp.json().then(response => console.log(response));
        });
}

export function delSol(accountName, solFileName) {
  const dataToSrv = JSON.stringify({ type: OpSolType.DelSol,
    chainName,
    accountName: accountName,
    sharedAccountName: '',
    solFileName: solFileName,
    newSolFileName: "",
    solFileContent: ""});
  fetch(userFileAddr, 
        {headers: { "Content-Type": "application/json" }, method: 'POST', body: dataToSrv})
  .then(resp => {
          resp.json().then(response => console.log(response));
        });
}

export function updateSol(accountName, solFileName, solFileContent) {
  const dataToSrv = JSON.stringify({ type: OpSolType.UpdateSol,
    chainName,
    accountName: accountName,
    sharedAccountName: '',
    solFileName: solFileName,
    newSolFileName: "",
    solFileContent: solFileContent});
  fetch(userFileAddr, 
        {headers: { "Content-Type": "application/json" }, method: 'POST', body: dataToSrv})
  .then(resp => {
          resp.json().then(response => console.log(response));
        });
}

export async function listSol(accountName) {
  const dataToSrv = JSON.stringify({ type: OpSolType.ListSol,
    chainName,
    accountName: accountName,
    sharedAccountName: '',
    solFileName: "",
    newSolFileName: "",
    solFileContent: ""});
  let resp = await fetch(userFileAddr, 
        {headers: { "Content-Type": "application/json" }, method: 'POST', body: dataToSrv});
  resp = await resp.json();
  console.log(resp);
  return resp;
}

export function renameSol(accountName, solFileName, newSolFileName) {
  const dataToSrv = JSON.stringify({ type: OpSolType.RenameSol,
    chainName,
    accountName: accountName,
    sharedAccountName: '',
    solFileName: solFileName,
    newSolFileName: newSolFileName,
    solFileContent: ""});
  fetch(userFileAddr, 
        {headers: { "Content-Type": "application/json" }, method: 'POST', body: dataToSrv})
  .then(resp => {
          resp.json().then(response => console.log(response));
        });
}

export async function compileSol(accountName, solFileName) {
  const dataToSrv = JSON.stringify({ type: OpSolType.CompileSol,
    chainName,
    accountName: accountName,
    sharedAccountName: '',
    solFileName: solFileName,
    newSolFileName: "",
    solFileContent: ""});
  let resp = await fetch(userFileAddr, 
      {headers: { "Content-Type": "application/json" }, method: 'POST', body: dataToSrv});
  resp = await resp.json();
  console.log(resp);
  return resp;
}

export async function listSharedSol(accountName, sharedAccountName) {
  const dataToSrv = JSON.stringify({ type: OpSolType.ListSharedAccount,
    chainName,
    accountName: accountName,
    sharedAccountName: sharedAccountName,
    solFileName: solFileName,
    newSolFileName: "",
    solFileContent: ""});
  let resp = await fetch(userFileAddr, 
      {headers: { "Content-Type": "application/json" }, method: 'POST', body: dataToSrv});
  resp = await resp.json();
  console.log(resp);
  return resp;
}

export async function getSharedSol(accountName, sharedAccountName, solFileName) {
  const dataToSrv = JSON.stringify({ type: OpSolType.GetSharedSol,
    chainName,
    accountName: accountName,
    sharedAccountName: sharedAccountName,
    solFileName: solFileName,
    newSolFileName: "",
    solFileContent: ""});
  let resp = await fetch(userFileAddr, 
      {headers: { "Content-Type": "application/json" }, method: 'POST', body: dataToSrv});
  resp = await resp.json();
  console.log(resp);
  return resp;
}