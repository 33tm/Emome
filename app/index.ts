import { app, screen, globalShortcut, BrowserWindow, Notification, Tray } from "electron"
import { readFile, writeFile } from "fs/promises"
import { join } from "path"

const open = () => {
    const [window] = BrowserWindow.getAllWindows()

    if (window && window.isFocused()) {
        window.close()
        return
    }

    const { width, height } = screen.getPrimaryDisplay().workAreaSize

    const emome = new BrowserWindow({
        width: 400,
        height: 300,
        x: width - 400,
        y: height - 300,
        frame: false,
        resizable: false,
        fullscreenable: false,
        skipTaskbar: true,
        webPreferences: {
            nodeIntegration: true
        }
    })

    emome.loadFile("../index.html")

    emome.on("blur", () => emome.close())
}

app.whenReady().then(async () => {
    const config = join(app.getPath("userData"), "config.json")

    // const { shortcut } = await readFile(config).catch(() => {
    //     writeFile(config, JSON.stringify({ shortcut: "Shift+Option+E" }))
    //     return { shortcut: "Shift+Option+E" }
    // }).then(data => JSON.parse(data.toString()))

    const shortcut = process.platform === "darwin" ? "Shift+Option+E" : "Shift+Alt+E"

    globalShortcut.register(shortcut, open)

    const tray = new Tray("icon.png")

    tray.on("click", open)

    new Notification({
        title: "Emome Started!",
        body: `Via ${shortcut}`
    }).show()
})

app.on("window-all-closed", () => process.platform === "darwin" && app.dock.hide())

app.on("will-quit", () => globalShortcut.unregisterAll())