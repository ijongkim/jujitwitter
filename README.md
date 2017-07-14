# TopTenTweets
Pull the Top 10 representative tweets of a given Twitter user

##Installation##
Clone to working directory, run `npm install` to install dependencies. Create a `.env` file to store your API `KEY` and `SECRET`, as well as `PORT`.

##How to use##
Open web brower (Chrome is recommended but not necessary) and navigate to `http://localhost:PORT/` or `http://127.0.0.1:PORT/` to enter the user you'd like to analyze.

##How does this work?##
It fetches ~3200 most recent tweets, processes the collection, scores each tweet, then presents the top 10 representative tweets for you to enjoy. A random sample of 10 tweets is also available for comparison. See for yourself if the algorithm does a better job than picking at random! A chart of the user's monthly average sentiment and top 25 words are also available.

##Okay, you say "representative tweet". What's that even mean?##
Fair question, a representative tweet in this instance is considered an summary reflection of the user's interests, attitude, and values or essentially: "Does this sound like something the user would say?".

##How did you determine these scores?##
The algorithm takes the collection of tweets, removes any retweets, then builds a word frequency and trigram frequency. Frequencies are ranked low to high and each item is assigned a value equal to its relative rank. The presence of a frequent word added more to a tweet's score, while the presence of a frequent trigram was heavily penalized. Sentiment is also taken into account by calculating an average comparative sentiment score for the collection, and reducing each tweet's score according to how far away its sentiment is to the average.