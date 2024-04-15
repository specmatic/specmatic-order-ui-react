import { render, screen, waitFor } from '@testing-library/react'
import 'core-js'
import App from '../App'
import { startStub, stopStub, setExpectations } from 'specmatic'
let jp = require('jsonpath')

const GADGET_LIST_EXPECTATION_FILE = "specmatic-expectations/gadget_list.json"
const EMPTY_GADGET_LIST_EXPECTATION_FILE="specmatic-expectations/no_data_found_gadget_list.json"
const TIMEOUT_EXPECTATION_FILE="specmatic-expectations/timeout.json"
const gadgetListExpectationObject = require('./' + GADGET_LIST_EXPECTATION_FILE)
const gadgetList = jp.query(gadgetListExpectationObject, '$..body[*]')

const STUB_HOST = "localhost"
const STUB_PORT = 9000
const STUB_URL = "http://" + STUB_HOST + ":" + STUB_PORT
const timeout = 1500

let stub

beforeAll(async () => {
  stub = await startStub(STUB_HOST, STUB_PORT)
}, 120000)

test('renders gadgets list', async () => {
  //Arrange
  await setExpectations('src/__test__/' + GADGET_LIST_EXPECTATION_FILE)
  process.env.REACT_APP_API_URL=STUB_URL

  //Act
  render(<App type="gadget" />)

  //Assert
  await waitFor(() => {
    expect(screen.getAllByText("Product name").length).toBe(gadgetList.length)
  }, { timeout })
  
  gadgetList.map(gadget => gadget.name).forEach((gadgetName) => {
    expect(screen.getByText(gadgetName)).toBeInTheDocument()
  })
}, 120000)

test('Empty Product List', async () => {
  //Arrange
  await setExpectations('src/__test__/'+EMPTY_GADGET_LIST_EXPECTATION_FILE)
  process.env.REACT_APP_API_URL=STUB_URL

  //Act
  render(<App type="headphone" />)

  //Assert
  await waitFor(() => {
    expect(screen.getByText("No Products found")).toBeInTheDocument()
  }, {timeout})

}, 120000)


test('timeout error', async () => {
  //Arrange
  await setExpectations('src/__test__/'+TIMEOUT_EXPECTATION_FILE)
  process.env.REACT_APP_API_URL=STUB_URL

  //Act
  render(<App type="bike" />)

  //Assert
  await waitFor(() => {
    expect(screen.getByText("Timeout! Please try again...")).toBeInTheDocument()
  }, {timeout})

}, 120000)

afterAll(async () => {
  await stopStub(stub)
}, 120000)
