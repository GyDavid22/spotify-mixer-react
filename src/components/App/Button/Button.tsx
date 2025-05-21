import Icon from "../Icon/Icon";

interface IButton {
    text?: string;
    iconName?: string;
    styleName?: string;
    fill?: boolean;
    onClick?: () => void;
}

function Button({ text, iconName, styleName, fill, onClick }: IButton) {
    return (
        <button type="button" className={`btn btn-${fill ? '' : 'outline-'}${styleName ? styleName : 'primary'}`} onClick={onClick}>
            {
                iconName && <Icon classNames={`${iconName} me-1`}></Icon>
            }
            {text}
        </button>
    );
}

export default Button;