- Components implement interface containing 'render'
- Refactor synth.ts to use store for attack / decay?
  - Allows initial values to be set properly
  - Can't use store for note on/off easily though
- Add css arch knobs
- Vibrato mod wheel
- Multiple oscillators per note
- Clean up ScriptProcessorNodes memory usage for Karplus-Strong implementation

# TODONT?
- Use Action interface {type, payload}
- Remove need for EventPayload<T> by wrapping passed callback in function which
  pulls out .detail
  - For 'unlisten' method will need to store listeners in map for deletion
- Use switch on action.type instead of several store functions
