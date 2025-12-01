import { render, screen, waitFor } from '@testing-library/react'
import { GenericContainer, Wait } from "testcontainers";
import 'core-js'
import path from "node:path";
import App from '../App'
const jp = require('jsonpath')

/**
 * @type {import("testcontainers").StartedTestContainer}
 */
let stub
const GADGET_LIST_EXPECTATION_FILE = "specmatic-expectations/gadget_list.json"
const expectationsDir = path.resolve("src/__test__/specmatic-expectations")
const stubHost = "localhost"
const stubPort = 9000
const timeout = 1500

beforeAll(async () => {
    process.env.REACT_APP_API_URL = `http://${stubHost}:${stubPort}`
    stub = await new GenericContainer("specmatic/specmatic")
        .withBindMounts([
            { source: path.resolve("specmatic.yaml"), target: "/usr/src/app/specmatic.yaml" },
            { source: expectationsDir, target: "/usr/src/app/examples" }
        ])
        .withCommand(["virtualize", "--examples", "examples", "--port", `${stubPort}`])
        .withExposedPorts({ host: stubPort, container: stubPort })
        .withLogConsumer(stream => {
            stream.on("data", process.stdout.write);
            stream.on("err", process.stderr.write);
            stream.on("end", () => process.stdout.write("Specmatic log stream ended"));
        })
        .withWaitStrategy(Wait.forLogMessage(/Stub server is running/i))
        .start();
}, 120000)

test('renders gadgets list', async () => {
    render(<App type="gadget" />)
    const gadgetListExpectationObject = require(`./${GADGET_LIST_EXPECTATION_FILE}`)
    const gadgetList = jp.query(gadgetListExpectationObject, '$..body[*]')
    await waitFor(() => expect(screen.getAllByText("Product name").length).toBe(gadgetList.length), { timeout })
    for (const gadget of gadgetList) expect(screen.getByText(gadget.name)).toBeInTheDocument()
}, 120000)

test('Empty Product List', async () => {
    render(<App type="book" />)
    await waitFor(() => expect(screen.getByText("No Products found")).toBeInTheDocument(), { timeout })
}, 120000)


test('timeout error', async () => {
    render(<App type="other" />)
    await waitFor(() => expect(screen.getByText("Timeout! Please try again...")).toBeInTheDocument(), { timeout })
}, 120000)

afterAll(async () => {
    await stub.stop()
}, 120000)
