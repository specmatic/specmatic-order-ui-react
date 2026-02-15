import { render, screen, waitFor } from '@testing-library/react'
import { GenericContainer, Wait } from "testcontainers";
import 'core-js'
import path from "node:path";
import App from '../App'
const jp = require('jsonpath')

/**
 * @type {import("testcontainers").StartedTestContainer}
 */
let mock
const GADGET_LIST_EXPECTATION_FILE = "specmatic-expectations/gadget_list.json"
const timeout = 1500

beforeAll(async () => {
    mock = await new GenericContainer("specmatic/specmatic")
        .withBindMounts([
            { source: path.resolve("specmatic.yaml"), target: "/usr/src/app/specmatic.yaml" },
            { source: path.resolve("src"), target: "/usr/src/app/src" },
            { source: path.resolve("build/reports/specmatic"), target: "/usr/src/app/build/reports/specmatic" },
        ])
        .withCommand(["mock"])
        .withNetworkMode("host")
        .withLogConsumer(stream => {
            stream.on("data", process.stdout.write);
            stream.on("err", process.stderr.write);
            stream.on("end", () => process.stdout.write("Specmatic log stream ended"));
        })
        .withWaitStrategy(Wait.forLogMessage(/Mock server is running/i))
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
    render(<App type="headphone" />)
    await waitFor(() => expect(screen.getByText("No Products found")).toBeInTheDocument(), { timeout })
}, 120000)


test('timeout error', async () => {
    render(<App type="bike" />)
    await waitFor(() => expect(screen.getByText("Timeout! Please try again...")).toBeInTheDocument(), { timeout })
}, 120000)

afterAll(async () => {
  console.log("Stopping HTTP Mock server");
  await mock?.stop({
    timeout: 60_000,   // give Specmatic time to generate reports
    remove: true       // optional; default behavior depends on your config
  });
  console.log("HTTP Mock stopped");
}, 120_000);