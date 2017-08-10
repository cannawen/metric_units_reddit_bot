#!/bin/bash
fswatch -0 ./src ./test | xargs -0 -n 1 -I {} npm test
