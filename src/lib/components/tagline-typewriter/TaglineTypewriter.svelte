<script lang="ts">
    import { onMount, onDestroy } from 'svelte';

    let { tags = [] } = $props();

    const prefix = 'Simple ';
    const suffix = ' recipes, made by the community.';
    const typingSpeed = 50;
    const deleteSpeed = 30;
    const pauseDelay = 1500;

    let text = $state('');
    let currentWordIndex = 0;
    let running = true;

    function delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function typeString(str: string, speed = typingSpeed) {
        for (const char of str) {
            if (!running) return;
            text += char;
            await delay(speed);
        }
    }

    async function deleteChars(count: number) {
        for (let i = 0; i < count; i++) {
            if (!running) return;
            text = text.slice(0, -1);
            await delay(deleteSpeed);
        }
    }

    async function start() {
        const firstWord = tags[0] || 'food';
        await typeString(prefix + firstWord + suffix);
        await delay(pauseDelay);
        currentWordIndex = 1 % tags.length;
        let currentWord = firstWord;

        while (running && tags.length > 0) {
            text = prefix + currentWord; // jump to end of word
            await deleteChars(currentWord.length);
            currentWord = tags[currentWordIndex];
            await typeString(currentWord);
            await typeString(suffix);
            await delay(pauseDelay);
            currentWordIndex = (currentWordIndex + 1) % tags.length;
        }
    }

    onMount(() => {
        start();
    });

    onDestroy(() => {
        running = false;
    });
</script>

<span class="typewriter">{text}<span class="cursor"></span></span>

<style lang="scss">
    .typewriter {
        white-space: nowrap;
    }

    .cursor {
        display: inline-block;
        width: 1px;
        background: currentColor;
        margin-left: 2px;
        animation: blink 1s steps(1) infinite;
    }

    @keyframes blink {
        0%, 50% { opacity: 1; }
        50.01%, 100% { opacity: 0; }
    }
</style>
