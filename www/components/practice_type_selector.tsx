import type { Accessor, Setter } from 'solid-js'

export enum PracticeType {
  Listening = 'listening',
  Writing = 'writing',
  Typing = 'typing',
  Speaking = 'speaking',
}

export default function PracticeTypeSelector({ practiceType, setPracticeType }: {
  practiceType: Accessor<PracticeType>
  setPracticeType: Setter<PracticeType>
}) {
  return (
    <div class='pa2' style='border: 1px solid rgb(204, 204, 204);'>
      <p class='mt0'>Practice:</p>
      <input
        type='radio'
        id={PracticeType.Writing}
        name='input-type'
        value={`input-${PracticeType.Writing}`}
        class='mh1'
        checked={practiceType() === PracticeType.Writing}
        onClick={[setPracticeType, PracticeType.Writing]}
      />
      <label class='mr3' for={PracticeType.Writing}>writing</label>

      <input
        type='radio'
        id={PracticeType.Typing}
        name='input-type'
        value={`input-${PracticeType.Typing}`}
        class='mh1'
        checked={practiceType() === PracticeType.Typing}
        onClick={[setPracticeType, PracticeType.Typing]}
      />
      <label class='mr3' for={PracticeType.Typing}>typing</label>

      <input
        type='radio'
        id={PracticeType.Speaking}
        name='input-type'
        value={`input-${PracticeType.Speaking}`}
        class='mh1'
        checked={practiceType() === PracticeType.Speaking}
        onClick={[setPracticeType, PracticeType.Speaking]}
      />
      <label class='mr3' for={PracticeType.Speaking}>speaking</label>

      <input
        type='radio'
        id={PracticeType.Listening}
        name='input-type'
        value={`input-${PracticeType.Listening}`}
        class='mh1'
        checked={practiceType() === PracticeType.Listening}
        onClick={[setPracticeType, PracticeType.Listening]}
      />
      <label for={PracticeType.Listening}>listening</label>
    </div>
  )
}
