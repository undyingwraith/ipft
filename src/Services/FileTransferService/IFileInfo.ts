export interface IFileInfo {
	name: string;
	size: number;
	mime: string;
}

export function isIFileInfo(item: any): item is IFileInfo {
	return typeof item.name === 'string' && typeof item.size === 'number' && typeof item.mime === 'string';
}
