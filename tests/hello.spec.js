 const sayHello = require('../src/services/helloWorld');

describe('Say Hello tests', () => {
    it('Should say Hello World', () => {
        const response = sayHello.sayHello();

        expect(response).toBe('Hello World!');
    })

    it('Should say Hello Magno', () => {
        const response = sayHello.sayHello('Magno');

        expect(response).toBe('Hello Magno!');

    })
})