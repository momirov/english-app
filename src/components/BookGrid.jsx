import BookCard from './BookCard.jsx';
import Header from './Header.jsx';

export default function BookGrid({ books, onSelectBook }) {
  return (
    <div className="page">
      <Header title="English Plus" />
      <main className="unit-grid-main">
        <p className="home-subtitle">Choose a book</p>
        <div className="unit-grid">
          {books.map((book) => (
            <BookCard key={book.id} book={book} onClick={() => onSelectBook(book.id)} />
          ))}
        </div>
      </main>
    </div>
  );
}
