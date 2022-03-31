/*
 * define here the form actions
 */

export const actions = {
  'action_1': (property) => {
    actions['onModelChangeFinal'].emit('action_1')
  },
  'action_2': (property) => {
    actions['onModelChangeFinal'].emit('action_2')
  }
}
