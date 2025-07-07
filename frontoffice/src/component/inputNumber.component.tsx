export const InputNumber = () => {
    return (
        <div>
            <input type="number" className="input validator" required placeholder="Type a number between 1 to 10" 
                min="1" max="10"
                title="Must be between be 1 to 10" />
            <p className="validator-hint">Must be between be 1 to 10</p>
        </div>
    )
}