import { Search } from '../assets/Search';
import './styles.scss';

export type SearchbarProps = {
	onChange?: (value: string) => void;
};

export function Searchbar({ onChange }: SearchbarProps) {
	return (
		<div className='searchbar-container'>
			<input
				type='search'
				id='searchbar'
				name='searchbar'
				placeholder='Rechercher'
				className='search-input'
				aria-label='Rechercher'
				onChange={(ev) => void onChange?.(ev.target.value)}
			/>

			<Search className='icon' />
		</div>
	);
}
