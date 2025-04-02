import { expect } from 'vitest';

export class PromiseTracker<T> {
    #ended: boolean = false;
    get ended() {
        return this.#ended;
    }

    #success: boolean | undefined;
    get success() {
        return this.#success;
    }

    #result: T | undefined;
    get result(): T {
        if (!this.#ended) {
            throw new Error('This promise is still in progress');
        }
        if (!this.#success) {
            throw new Error('This promise has failed');
        }
        return this.#result!;
    }

    #error: unknown;
    get error() {
        if (!this.#ended) {
            throw new Error('This promise is still in progress');
        }
        if (this.#success) {
            throw new Error("This promise hasn't failed");
        }
        return this.#error;
    }

    constructor(promise: Promise<T>) {
        promise.then(
            (result) => {
                this.#ended = true;
                this.#success = true;
                this.#result = result;
            },
            (error) => {
                this.#ended = true;
                this.#success = false;
                this.#error = error;
            },
        );
    }

    toString(): string {
        if (!this.#ended) {
            return 'Pending';
        }
        if (this.#success) {
            return `Success: ${String(this.#result)}`;
        }

        return `Failed: ${String(this.#error)}`;
    }

    expectPending() {
        if (!this.#ended) {
            return;
        }

        expect.fail(`Expected promise to be pending. But status is: ${this.toString()}`);
    }

    expectEnded() {
        if (this.#ended) {
            return;
        }

        expect.fail(`Expected promise to be ended. But status is: ${this.toString()}`);
    }
}
