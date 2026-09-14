const { app, ipcMain } = require("electron");
const fs = require("fs/promises");
const path = require("path");

/**
 * Backup automático em disco.
 *
 * Vai para Documentos/ORBIT/backups e não para userData de propósito: no
 * Windows, Documentos costuma estar sincronizado (OneDrive), então o backup
 * sai da máquina sozinho. Backup que mora no mesmo disco do original só
 * protege contra engano do usuário, não contra perda do disco.
 *
 * Escrita atômica: grava em .tmp e renomeia. Um desligamento no meio da
 * gravação não deixa um backup pela metade sobrescrevendo o bom de ontem.
 */

const MANTER = 14;

function pasta() {
  return path.join(app.getPath("documents"), "ORBIT", "backups");
}

async function limparAntigos(dir) {
  const arquivos = (await fs.readdir(dir))
    .filter(f => f.startsWith("orbit-") && f.endsWith(".json"))
    .sort();
  const excedente = arquivos.slice(0, Math.max(0, arquivos.length - MANTER));
  await Promise.all(excedente.map(f => fs.unlink(path.join(dir, f)).catch(() => {})));
}

async function salvar(conteudo) {
  if (typeof conteudo !== "string" || !conteudo.length) {
    throw new Error("conteúdo vazio");
  }

  const dir = pasta();
  await fs.mkdir(dir, { recursive: true });

  const nome = `orbit-${new Date().toISOString().slice(0, 10)}.json`;
  const destino = path.join(dir, nome);
  const temporario = `${destino}.tmp`;

  await fs.writeFile(temporario, conteudo, "utf8");
  await fs.rename(temporario, destino);
  await limparAntigos(dir);

  return destino;
}

function registrar() {
  ipcMain.handle("backup:salvar", async (_evento, conteudo) => {
    try {
      return { ok: true, caminho: await salvar(conteudo) };
    } catch (erro) {
      return { ok: false, erro: erro.message };
    }
  });

  ipcMain.handle("backup:pasta", () => pasta());
}

module.exports = { registrar, pasta };
