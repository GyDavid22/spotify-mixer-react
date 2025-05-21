interface IIcon {
    classNames: string;
}

function Icon({classNames}: IIcon) {
    return (
        <i className={`bi ${classNames}`}></i>
    );
}

export default Icon;