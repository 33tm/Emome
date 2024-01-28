import { app, screen, globalShortcut, BrowserWindow, Notification, Tray } from "electron"
import { readFile, writeFile } from "fs/promises"
import * as path from "path"

const open = () => {
    const [window] = BrowserWindow.getAllWindows()

    if (window) return window.close()

    const { width, height } = screen.getPrimaryDisplay().workAreaSize

    const emome = new BrowserWindow({
        width: 400,
        height: 500,
        x: width - 400,
        y: height - 500,
        frame: false,
        resizable: false,
        fullscreenable: false
    })

    emome.on("blur", () => emome.hide())

    emome.loadFile("../index.html")
}

app.whenReady().then(async () => {
    const config = path.join(app.getPath("userData"), "config.json")

    // const { shortcut } = await readFile(config).catch(() => {
    //     writeFile(config, JSON.stringify({ shortcut: "Shift+Option+E" }))
    //     return { shortcut: "Shift+Option+E" }
    // }).then(data => JSON.parse(data.toString()))

    const shortcut = "Shift+Alt+E"

    globalShortcut.register(shortcut, open)

    const tray = new Tray("icon.png")

    tray.on("click", open)

    new Notification({
        title: "Emome Started!",
        body: `Via ${shortcut}`
    }).show()
})

app.on("window-all-closed", () => app.dock.hide())

app.on("will-quit", () => globalShortcut.unregisterAll())