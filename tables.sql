CREATE TABLE Image
    (
        'id' integer primary key autoincrement,
        'fileName' varchar(255)
    )
;

CREATE TABLE Comment
    (
        'id' integer primary key autoincrement,
        'text' varchar(255),
        'imageID' integer,
        FOREIGN KEY(imageID) REFERENCES Image(id)
    )
;

INSERT INTO Image
    ('fileName')
VALUES
    ('test.png'),
    ('test2.jpg')
;

INSERT INTO Comment
VALUES (1, 'testcomment', 1);

INSERT INTO Comment
VALUES (2, 'testcomment2', 1);

INSERT INTO Comment
VALUES (3, 'testcomment3', 1);

INSERT INTO Comment
VALUES (4, 'testcomment', 2);

INSERT INTO Comment
VALUES (5, 'testcomment2', 2);

INSERT INTO Comment
VALUES (6, 'testcomment3', 2);
