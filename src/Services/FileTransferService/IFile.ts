import { IFileInfo, isIFileInfo } from './IFileInfo';

export interface IFile extends IFileInfo {
	content: Uint8Array;
}

export function isIFile(item: any): item is IFile {
	return item.content !== undefined && isIFileInfo(item);
}
