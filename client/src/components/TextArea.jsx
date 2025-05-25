export default function TextArea({props}){
    return(
        <div className="NewsBlock">
            <span className="News">
                <p className="NewsTitle">Tytuł: {props.title}</p>
                <p className="NewsDesc">Opis: {props.description}</p>
                    <p className="NewsContent">Zawartosc: {props.content}</p>
                <img src={props.image} alt="Obrazek"/>
                <p className="NewsPublishedAt">Opublikowane w: {props.publishedAt}</p>
            </span>
        </div>
    )
}