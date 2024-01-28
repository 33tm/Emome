import * as tf from "@tensorflow/tfjs-node-gpu"
import { readFileSync, readdirSync } from "fs"

(async () => {
    const load = (path: string) => {
        const images = []
        const labels = []
        for (const category of readdirSync(`./FER-2013/${path}`)) {
            for (const file of readdirSync(`./FER-2013/${path}/${category}`)) {
                const buffer = readFileSync(`./FER-2013/${path}/${category}/${file}`)
                const tensor = tf.node.decodeImage(buffer)
                    .toFloat()
                    .div(255.0)
                    .expandDims()
                images.push(tensor)
                labels.push(category)
            }
        }
        return {
            images: tf.concat(images.slice(-100)),
            labels: tf.oneHot(tf.tensor1d(labels.slice(-100), "int32"), 5)
        }
    }

    const model = tf.sequential()

    model.add(tf.layers.conv2d({
        inputShape: [48, 48, 1],
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

    model.compile({
        optimizer: tf.train.adam(0.0001),
        loss: "categoricalCrossentropy",
        metrics: ["accuracy"]
    })

    const train = load("train")
    const test = load("test")

    await model.fit(train, train, {
        epochs: 10,
        validationData: [test.images, test.labels]
    })

    console.log(`Loss ${model.evaluate(test.images, test.labels)[0].dataSync()[0].toFixed(2)}`)
    console.log(`Accuracy ${model.evaluate(test.images, test.labels)[1].dataSync()[0].toFixed(2)}`)

    model.save("file://model")
})()