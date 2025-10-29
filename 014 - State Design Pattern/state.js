export const states = {
    STANDING_LEFT: 0,
    STANDING_RIGHT: 1,
    SITTING_LEFT: 2,
    SITTING_RIGHT: 3,
    RUNNING_LEFT: 4,
    RUNNING_RIGHT: 5,
    JUMPING_LEFT: 6,
    JUMPING_RIGHT: 7,
    FALLING_LEFT: 8,
    FALLING_RIGHT: 9
}

class State {
    constructor(state) {
        this.state = state;
    }
}

export class StandingLeft extends State {
    constructor(player) {
        super('STANDING LEFT');
        this.player = player;
    }
    enter() {
        this.player.frameY = 1;
    }
    handleInput(input) {
        if (input === 'PRESS right') this.player.setState(states.STANDING_RIGHT);
    }
}

export class StandingRight extends State {
    constructor(player) {
        super('STANDING RIGHT');
        this.player = player;
    }
    enter() {
        this.player.frameY = 0;
    }
    handleInput(input) {
        if (input === 'PRESS left') this.player.setState(states.STANDING_LEFT);
    }
}

export class SittingLeft extends State {
    constructor(player) {
        super('SITTING LEFT');
        this.player = player;
    }
    enter() {
        this.player.frameY = 9;
    }
    handleInput(input) {
        if (input === 'PRESS right') this.player.setState(states.SITTING_RIGHT);
        else if (input === 'RELEASE up') this.player.setState(states.STANDING_RIGHT);
    }
}