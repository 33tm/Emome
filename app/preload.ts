import { contextBridge } from "electron"

contextBridge.exposeInMainWorld("electron", {
    emoji: (emoji: string) => {
        console.log(emoji)
        const emojiElement = document.createElement("img")
        emojiElement.src = `https://twemoji.maxcdn.com/v/latest/svg/${emoji.charCodeAt(0).toString(16)}.svg`
        return emojiElement
    }
})