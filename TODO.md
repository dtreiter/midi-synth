- Components implement interface containing 'render'
- Use Action interface {type, payload}
- Remove need for EventPayload<T> by wrapping passed callback in function which
  pulls out .detail
  - For 'unlisten' method will need to store listeners in map for deletion
- Use swtich on action.type instead of several store functions
- Refactor midi.js to use store for attack / decay?
  - Allows initial values to be set properly
  - Can't use store for note on/off easily though

- Add css arch knobs
- Add waveform selector (triangle, square)