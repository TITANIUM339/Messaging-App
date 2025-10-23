export default function Spinner({ size = 16 }: { size?: number }) {
    return (
        <div
            className="animate-spin rounded-full border-3 border-t-white border-r-zinc-900 border-b-white border-l-white"
            style={{ width: size, height: size }}
        ></div>
    );
}
