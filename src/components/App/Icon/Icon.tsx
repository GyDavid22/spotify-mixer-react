interface IIcon {
    name: string;
}

function Icon({name}: IIcon) {
    return (
        <i className={`bi ${name}`}></i>
    );
}

export default Icon;