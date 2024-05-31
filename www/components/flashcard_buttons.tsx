export default function FlashcardButtons({ onSuccess, onFailure, isVisible }) {
  return (
    <div
      class='mv3 shadow br3 w-50'
      style='margin-left: auto; margin-right: auto;'
    >
      <div style={`visibility: ${isVisible() ? 'visible' : 'hidden'}`}>
        <button
          class='ma3 pointer'
          style='border:none; background-color: white; outline: none;'
          onClick={onSuccess}
        >
          <h1>✅</h1>
        </button>
        <button
          class='ma3 pointer'
          style='border:none; background-color: white; outline: none;'
          onClick={onFailure}
        >
          <h1>❌</h1>
        </button>
      </div>
    </div>
  )
}
