CREATE TABLE blogs (
    id SERIAL PRIMARY KEY,
    author text,
    url text NOT NULL,
    title text NOT NULL,
    likes INT DEFAULT 0
);

insert into blogs (author, url, title) values ('Rick', 'https://github.com/RickYCYang', 'Hello World Rick');
insert into blogs (author, url, title, likes) values ('Aris', 'https://www.google.com', 'Hello World Aris', 1);