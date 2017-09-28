# Get Activation Code Microservice

An AWS Lambda Microservice to process the incoming REST API requests and send response based on Complex Business Rules and Internal API calls.

## Tech Highlights
1. Use of Promises and Generators
2. Seperation of concerns from Field Validations & Business Validations
3. Parallel API calls and joins saving on roundtrips
4. Optimization in the data objects

## Lambda Fn test Locally
```javascript
npm install

lambda-local -l index.js -e event.json -h handler -t 15

```
