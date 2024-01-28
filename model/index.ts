import * as tf from "@tensorflow/tfjs-node"
import { readFileSync, readdirSync } from "fs"
import { join } from "path"

const load = (path: string) => {
    const images = []
    const labels = []
    const categories = readdirSync(path)
    for (const category of categories) {
        if (category === ".DS_Store") continue // hate you macos
        for (const file of readdirSync(join(path, category))) {
            const buffer = readFileSync(join(path, category, file))
            const tensor = tf.node.decodeImage(buffer)
                .resizeNearestNeighbor([96, 96])
                .toFloat()
                .div(tf.scalar(255.0))
                .expandDims()
            images.push(tensor)
            labels.push(categories.indexOf(category))
        }
    }
    return {
        images: tf.concat(images),
        labels: tf.oneHot(tf.tensor1d(labels, "int32"), 7).toFloat()
    }
}

const model = tf.sequential()

model.add(tf.layers.conv2d({
    inputShape: [96, 96, 1],
    filters: 32,
    kernelSize: [3, 3],
    activation: "relu",
}))

model.add(tf.layers.conv2d({
    filters: 32,
    kernelSize: [3, 3],
    activation: "relu",
}))

model.add(tf.layers.maxPooling2d({ poolSize: [2, 2] }))
model.add(tf.layers.dropout({ rate: 0.3 }))
model.add(tf.layers.flatten())
model.add(tf.layers.dense({ units: 256, activation: "relu" }))
model.add(tf.layers.dropout({ rate: 0.3 }))
model.add(tf.layers.dense({ units: 7, activation: "softmax" }))

const optimizer = tf.train.adam(0.0001)

model.compile({
    optimizer: optimizer,
    loss: "categoricalCrossentropy",
    metrics: ["accuracy"],
})

const { images, labels } = load("./FER-2013/train")
const test = load("./FER-2013/test")

model.fit(images, labels, {
    epochs: 10,
    batchSize: 4,
    validationSplit: 0.15
}).then(({ history }) => {
    const { images, labels } = test
    const result = model.evaluate(images, labels)
    console.log(`Loss ${history.loss[0]} ${result[0].dataSync()[0].toFixed(3)}`)
    console.log(`Accuracy ${history.acc[0]} ${result[1].dataSync()[0].toFixed(3)}`)
    model.save("file://model")
})