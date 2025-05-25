export default function Button({text,action}) {
    return(
        <button className="buttonSign" onClick={action}>{text}</button>
    )
}