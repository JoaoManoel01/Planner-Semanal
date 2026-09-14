const { contextBridge, ipcRenderer } = require("electron");

/**
 * Ponte mínima entre a interface e o processo principal.
 *
 * Expõe exatamente duas operações de backup e nada mais — sem `require`, sem
 * acesso a caminho arbitrário, sem Node no renderer. contextIsolation continua
 * ligado e nodeIntegration continua desligado.
 */
contextBridge.exposeInMainWorld("orbit", {
  desktop: true,
  salvarBackup: conteudo => ipcRenderer.invoke("backup:salvar", conteudo),
  ondeFicamOsBackups: () => ipcRenderer.invoke("backup:pasta")
});
