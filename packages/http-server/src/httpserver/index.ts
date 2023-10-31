export * from './server'

/** HTTPSServer module
 *
 * The purpose of this module is to handle all network-related
 * and operation-related elements of the API Server.
 *
 * This includes things like an executable program that runs
 * the abstract code, mappings to HTTP error codes. logging
 * and telemetry. You can avoid using this package if You
 * want to manage the lifecycle of the API server in your
 * own way, and just use the `ApiInstance` class to handle
 * state and logic
 */
