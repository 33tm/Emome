import * as tf from "@tensorflow/tfjs-node-gpu"
import { readFileSync, readdirSync } from "fs"

const images = []

const categories = readdirSync("./FER-2013/train")

for (const category of categories) {
    for (const file of readdirSync(`./FER-2013/train/${category}`)) {
        const buffer = readFileSync(`./FER-2013/train/${category}/${file}`)
        const tensor = tf.node.decodeImage(buffer)
            .toFloat()
            .div(255.0)
            .expandDims()
        images.push(tensor)
    }
}

console.log(images)

const model = tf.sequential()

model.add(tf.layers.conv2d({
    inputShape: [96, 96, 1],
    filters: 32,
    kernelSize: [3, 3],
    activation: "relu"
}))

model.add(tf.layers.conv2d({
    filters: 32,
    kernelSize: [3, 3],
    activation: "relu"
}))

model.add(tf.layers.maxPooling2d({ poolSize: [2, 2] }))
model.add(tf.layers.dropout({ rate: 0.3 }))
model.add(tf.layers.flatten())
model.add(tf.layers.dense({ units: 256, activation: "relu" }))
model.add(tf.layers.dropout({ rate: 0.3 }))
model.add(tf.layers.dense({ units: 5, activation: "softmax" }))

const optimizer = tf.train.adam(0.0001)

model.compile({
    optimizer,
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"]
})