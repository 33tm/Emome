import { contextBridge, ipcRenderer } from "electron"

console.log("fuksdkudaskluldks")

contextBridge.exposeInMainWorld("electron", {
    emoji: () => {
        ipcRenderer.on("emoji", (event, arg) => {
            console.log(arg)
        })
    }
})