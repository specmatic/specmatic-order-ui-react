// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom'
import { TextEncoder, TextDecoder } from 'util';
import { ReadableStream, WritableStream } from 'stream/web';
import { MessageChannel, MessagePort } from 'worker_threads';
Object.assign(global, { TextDecoder, TextEncoder });
Object.assign(global, { ReadableStream, WritableStream });
Object.assign(global, { MessageChannel, MessagePort });