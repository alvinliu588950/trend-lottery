# Trenderland Lottery

2019 Spring party lottery site

[Demo](https://adc.github.trendmicro.com/pages/skyduck-su/trenderland-lottery/build)

## Keyboard control
|Key|Action|
|---|---|
|f|Toggle fullscreen|
|left arrow|Previous state|
|right arrow, space|Next state|
|backspace|Revert one lottery result|

## Lottery states
There are three pages in the Trenderland Lottery App. The view goes to the previous/next state of the current page while hitting corresponding keys, and changes the current page if reaches the fist/final state.

When page is changed, it starts from the first state of the page.

### Page 0: Entrance page
- Step 0: Empty page
- Step 1: Title animation

### Page 1: Introduction page
- Step 0: Empty page
- Step 1: List of the lottery awards

### Page 2: Lottery page
- Step 0: Lottery table

Select a PSID and and an award from the bottom of the lottery page, then a result row will be added to the result table. If all the awards and PSIDs are matched, the table will be sorted by PSID automatically.

## Environment

### Node version
8.9

If using nvm:
```
nvm use
```

### Install dependencies
```
yarn
yarn bower
```

## Development
```
yarn start
```

## Build
```
yarn build
```
