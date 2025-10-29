export function drawStatusText(context, input, player) {
    context.font = '28px Helvetica';
    context.fillText('Last input: ' + input.lastKey, 20, 50);
    context.fillText('Current Status: ' + player.currentState.state, 20, 90)
}