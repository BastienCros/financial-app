import React, { useRef, useState } from "react";
import { DownloadIcon, TrashIcon } from "lucide-react";
import { cx, humanFileSize } from "@/utils";
import styles from "./fileUploader.module.css";

interface FileUploaderProps extends React.InputHTMLAttributes<HTMLInputElement> {
    id?: string;
    label?: string;
    onFileDrop: (file: File | null) => void;
}

// Note: Does not support multiple files

const DisplayFile = ({ file }: { file: File }) => {
    return (
        <>
            <p>
                Uploaded file:{" "}
                <span className="font-medium truncate">{file.name}</span>
            </p>
            <p>
                Uploaded size:{" "}
                <span className="font-medium">{humanFileSize(file.size)}</span>
            </p>
        </>
    );
};

export function FileUploader({
    id,
    label = "Drag & Drop or Click to Upload",
    onFileDrop,
    className,
    ...props
}: FileUploaderProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);

    const onClick = () => {
        inputRef.current?.click();
    };

    const handleFile = (files: FileList | null) => {
        if (files && files[0]) {
            setFile(files[0]);
            onFileDrop(files[0]);
        }
    };

    const clearFile = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setFile(null);
        onFileDrop(null);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        handleFile(e.target?.files);
    };

    const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        handleFile(e.dataTransfer.files);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === "Enter" || e.key === " ") {
            onClick();
        }
    };

    return (
        <div
            id={id}
            className={cx(
                styles.wrapper,
                dragActive && styles.wrapperDragActive,
                className,
            )}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={onClick}
            onKeyDown={handleKeyDown}
            role="button"
            tabIndex={0}
        >
            <DownloadIcon size={32} />
            <div className={styles.content} aria-live="polite">
                {file ? (
                    <DisplayFile file={file} />
                ) : (
                    <p className="font-medium">{label}</p>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                multiple={false}
                onChange={handleChange}
                className="hidden"
                {...props}
            />
            {file && (
                <button
                    onClick={clearFile}
                    aria-label="Remove file"
                    className={styles.close}
                >
                    <TrashIcon size={22} />
                </button>
            )}
        </div>
    );
}
