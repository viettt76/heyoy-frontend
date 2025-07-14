import { Images, SendHorizonal, Smile, X } from 'lucide-react';
import { useRef, useState } from 'react';
import wordIcon from '@/public/icons/word.svg';
import excelIcon from '@/public/icons/excel.svg';
import pdfIcon from '@/public/icons/pdf.svg';
import fileAltIcon from '@/public/icons/file.svg';
import Image from 'next/image';
import Textarea from '@/components/Textarea';
import { createConversationService, sendMessageService } from '@/services/conversationService';
import { useAppDispatch } from '@/redux/hooks';
import { assignConversationId } from '@/redux/slices/conversationSlice';
import { MessageType } from '@/lib/enums';
import { uploadToCloudinary } from '@/lib/utils';
import useClickOutside from '@/hooks/useClickOutside';
import EmojiPicker, { EmojiStyle } from 'emoji-picker-react';

export default function MessageInput({ conversationId, isFocus, friendId, type, avatar }) {
    const dispatch = useAppDispatch();

    const imageWrapperRef = useRef<HTMLDivElement>(null);
    const [showEmojiList, setShowEmojiList] = useState(false);
    const emojiListRef = useRef(null);

    useClickOutside(emojiListRef, () => setShowEmojiList(false));

    const [text, setText] = useState('');
    const [files, setFiles] = useState<
        {
            url: string;
            type: string;
            name: string;
        }[]
    >([]);
    const [filesUpload, setFilesUpload] = useState<File[]>([]);

    const [sendingMessage, setSendingMessage] = useState(false);

    const handleChooseFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = e.target.files;

        if (selectedFiles) {
            const filesArray = Array.from(selectedFiles).map((file) => ({
                url: URL.createObjectURL(file),
                type: file.type,
                name: file.name,
            }));

            setFiles((prev) => [...prev, ...filesArray]);
            setFilesUpload((prev) => [...prev, ...selectedFiles]);
        }
    };

    const handleDeleteImage = (index: number) => {
        setFiles((prev) => {
            return [...prev.slice(0, index), ...prev.slice(index + 1)];
        });
        setFilesUpload((prev) => {
            return [...prev.slice(0, index), ...prev.slice(index + 1)];
        });
    };

    const handleChangeText = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setText(e.target.value);
    };

    // Scroll horizontal
    const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
        if (e.shiftKey && imageWrapperRef.current) {
            e.preventDefault();
            imageWrapperRef.current.scrollBy({
                left: e.deltaY * 0.4,
                behavior: 'smooth',
            });
        }
    };

    const handleEnterKeydown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const handleSendMessage = async () => {
        try {
            if ((!text && files.length === 0) || sendingMessage) return;
            setSendingMessage(true);
            let _conversationId = conversationId;
            if (!_conversationId && friendId) {
                const res = await createConversationService({
                    type,
                    avatar,
                    participants: [friendId],
                });
                _conversationId = res.data.id;
                dispatch(
                    assignConversationId({
                        conversationId: _conversationId,
                        friendId,
                    }),
                );
            }

            if (text) {
                await sendMessageService({
                    conversationId: _conversationId,
                    content: text,
                    type: MessageType.TEXT,
                });
            }
            setText('');
            setFiles([]);
            if (filesUpload.length > 0) {
                await Promise.all(
                    filesUpload.map(async (file) => {
                        const fileData = await uploadToCloudinary(file);

                        const isImage = file.type.startsWith('image/');

                        await sendMessageService({
                            conversationId: _conversationId,
                            fileUrl: fileData?.fileUrl,
                            type: isImage ? MessageType.IMAGE : MessageType.FILE,
                            ...(!isImage && { fileName: fileData?.fileName }),
                        });
                    }),
                );
            }
        } catch (error) {
            console.error(error);
        } finally {
            setSendingMessage(false);
        }
    };

    return (
        <div className="flex gap-x-2 items-end py-2 border-t px-2">
            <label htmlFor="write-post-select-file" className="mb-2 block w-fit cursor-pointer">
                <Images className="text-[#41b35d]" />
            </label>
            <input type="file" multiple hidden id="write-post-select-file" onChange={handleChooseFile} />
            <div className="flex-1 overflow-hidden">
                <div className="flex overflow-x-auto gap-2 pt-1" ref={imageWrapperRef} onWheel={handleWheel}>
                    {files.map((file, index) => {
                        let src, alt;
                        const isImage = file.type.startsWith('image/');

                        if (file.type.startsWith('image/')) {
                            src = file.url;
                            alt = 'Image';
                        } else if (file.type === 'application/pdf') {
                            src = pdfIcon;
                            alt = 'PDF';
                        } else if (file.name.endsWith('.doc') || file.name.endsWith('.docx')) {
                            src = wordIcon;
                            alt = 'Word';
                        } else if (file.name.endsWith('.xls') || file.name.endsWith('.xlsx')) {
                            src = excelIcon;
                            alt = 'Excel';
                        } else {
                            src = fileAltIcon;
                            alt = 'File';
                        }

                        return (
                            <div
                                key={`file-${index}`}
                                className={`mb-1 relative rounded-xl ${isImage ? 'min-w-10 w-10 h-12' : 'w-fit ps-4'}`}
                            >
                                <div className="flex items-center">
                                    <Image
                                        className={`object-cover rounded-sm border ${
                                            isImage ? 'w-10 h-12' : 'w-4 h-4'
                                        }`}
                                        src={src}
                                        alt={alt}
                                        width={800}
                                        height={800}
                                        draggable={false}
                                    />
                                    {!isImage && file.name}
                                </div>
                                <div
                                    className="absolute -top-1 -right-1 bg-muted-foreground/70 rounded-full p-1 cursor-pointer"
                                    onClick={() => handleDeleteImage(index)}
                                >
                                    <X className="text-background w-3 h-3" />
                                </div>
                            </div>
                        );
                    })}
                </div>
                <Textarea
                    className="border-none outline-none focus:shadow-none focus:ring-0 bg-input rounded-3xl px-2 py-2 min-h-9 max-h-40"
                    text={text}
                    isFocus={isFocus}
                    placeholder="Aa"
                    onChange={handleChangeText}
                    onKeyDown={handleEnterKeydown}
                />
            </div>
            <div ref={emojiListRef} className="mb-2 relative">
                {showEmojiList && (
                    <EmojiPicker
                        className="!absolute bottom-[calc(100%+1rem)] right-1/4"
                        emojiStyle={EmojiStyle.FACEBOOK}
                        onEmojiClick={(e) => setText((prev) => prev + e.emoji)}
                    />
                )}
                <Smile onClick={() => setShowEmojiList(true)} />
            </div>
            <SendHorizonal
                className={`mb-2 ${(text || files.length > 0) && 'fill-primary/40 text-primary'}`}
                onClick={() => (text || files.length > 0) && handleSendMessage()}
            />
        </div>
    );
}
