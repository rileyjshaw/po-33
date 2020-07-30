# PO-33

A drum sample loader for my [Pocket Operator K.O.](https://teenage.engineering/guides/po-33/en)

# [~\*~ TRY IT HERE ~*~](https://rileyjshaw.com/po-33/)

## Usage

Drag and drop an audio file onto a pad. Click to play the sample. Once you've loaded a few, plug in your K.O. and click “Play all” to record the samples into a drum bank.

### Adding multiple samples at the same time

You can drag in multiple files at the same time. The first sample is assigned to whichever pad you dragged to. The rest of the files fill subsequent pads. Anything after Pad 16 gets cut off.

### Listening to samples

By default, samples will play once when you load them. To listen to them again, click the corresponding pad.

If you want to try your setup before loading it to the K.O., the following keyboard shortcuts map to pads:

|   |   |   |   |
|---|---|---|---|
| 1 | 2 | 3 | 4 |
| Q | W | E | R |
| A | S | D | F |
| Z | X | C | V |
|   |   |   |   |

### Reordering / deleting samples

You can reorder samples by dragging them. If you drag a sample out of the container, it's deleted.

### Settings

Click the nut icon in the top right to access a settings panel.

- **Speed:** Control the playback rate of samples. A value of `2` will play at double speed. `0.5` will play at half speed. Expects a number > 0.
  - Note: This is useful for preserving device memory. Set `speed=2` and pitch-shift the sample down by an octave on the K.O. to fit twice as much data.
- **Max sample length (ms):** Cuts off samples after a specified maximum duration, in milliseconds. Useful for kick and crash samples that just. never. end.
- **Gap between samples (ms):** If your K.O. is having trouble auto-slicing each drum sample, increasing the milliseconds between sample playback might help. Defaults to no gap, since I tend to trim it manually anyway.
- **Pad names:** I try to keep a specific layout with my kits, but you probably have a different style! You can tweak the text on each pad from 1–16, separated by commas.

#### Default settings

If you want to start the sampler with different settings, bookmark the link generated on the settings pane. For example, the following URL:

[`https://rileyjshaw.com/po-33/?speed=2&maxMs=2000&gapMs=20&padNames=1%2C2%2C3%2C4%2C5%2C6%2C7%2C8%2C9%2C10%2C11%2C12%2C13%2C14%2C15%2C16`](https://rileyjshaw.com/po-33/?speed=2&maxMs=2000&gapMs=20&padNames=1%2C2%2C3%2C4%2C5%2C6%2C7%2C8%2C9%2C10%2C11%2C12%2C13%2C14%2C15%2C16)

…will start you off at 2x speed, with a max duration of 2s, a gap of 20s, and pads renamed to their numbers.

### File types

This works with whatever file types your browser supports. It should work well with `.wav`, `.mp3`, `.ogg`, etc.

## To do

### v1 (now released 🎉)
- ~~Reorder samples~~ done
- ~~Delete sample~~ done
- ~~Keyboard control~~ done
- ~~Show total sample time~~ done
- ~~Configurable maximum sample length limit~~ done
- ~~Configurable gap between samples~~ done
- ~~Configurable speed / pitch control (eg. save memory by playing samples at 2x speed and slowing them down on the device)~~ done
- ~~Remove the URL search params, add a settings menu~~ done
- ~~Upload files on click~~ done

### Future, maybe?
- Default sounds (808?)
- Other tools than just drums?

## FAQ

### Does this upload my samples somewhere?

_No! This app works 100% locally, so your private samples remain private._

### Will this make sure the samples get trimmed to pads?

_Increasing the milliseconds between sample playback from the settings page might help._

## See also

- [PO-33 Scale App](https://punkyv4n.me/po-33-scale-app/)
- [OP-1 Drum Utility](https://splice.com/plugins/26589-op-1-drum-utility-vst-au-by-xfer-records)

### License

[GNU GPLv3](https://github.com/rileyjshaw/po-33/blob/master/README.md)
