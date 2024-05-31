import type { Accessor, Setter } from 'solid-js'

export enum DisplayType {
  Hiragana = 'Hiragana',
  Furigana = 'Furigana',
  Strokes = 'Strokes',
}

export default function DisplayTypeSelector({ displayType, setDisplayType }: {
  displayType: Accessor<DisplayType>
  setDisplayType: Setter<DisplayType>
}) {
  return (
    <div class='pa2' style='border: 1px solid rgb(204, 204, 204);'>
      <p class='mt0'>Display Type:</p>
      <input
        type='radio'
        id={DisplayType.Furigana}
        name='display-type'
        value={`input-${DisplayType.Furigana}`}
        class='mh1'
        checked={displayType() === DisplayType.Furigana}
        onClick={[setDisplayType, DisplayType.Furigana]}
      />
      <label class='mr3' for={DisplayType.Furigana}>Kanji w/ Furigana</label>

      <input
        type='radio'
        id={DisplayType.Hiragana}
        name='display-type'
        value={`input-${DisplayType.Hiragana}`}
        class='mh1'
        checked={displayType() === DisplayType.Hiragana}
        onClick={[setDisplayType, DisplayType.Hiragana]}
      />
      <label class='mr3' for={DisplayType.Hiragana}>Hiragana</label>

      <input
        type='radio'
        id={DisplayType.Strokes}
        name='display-type'
        value={`input-${DisplayType.Strokes}`}
        class='mh1'
        checked={displayType() === DisplayType.Strokes}
        onClick={[setDisplayType, DisplayType.Strokes]}
      />
      <label for={DisplayType.Strokes}>Stroke Order</label>
    </div>
  )
}
