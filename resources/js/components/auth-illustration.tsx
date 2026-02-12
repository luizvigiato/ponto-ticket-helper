type Props = {
    className?: string;
    children?: React.ReactNode;
    label?: string;
};

export default function AuthIllustration({
    className,
    children,
    label = 'Aqui uma imagem',
}: Props) {
    const base =
        'hidden min-h-96 items-center justify-center rounded-l-xl bg-muted md:col-span-3 md:flex';
    const composed = className ? `${base} ${className}` : base;

    return (
        <div className={composed}>
            {children ?? (
                <span className="text-sm text-muted-foreground">{label}</span>
            )}
        </div>
    );
}
