from flask import Flask, request, send_from_directory, make_response, jsonify
from sumy.parsers.plaintext import PlaintextParser
from sumy.summarizers.text_rank import TextRankSummarizer as Summarizer
from sumy.nlp.tokenizers import Tokenizer
from sumy.nlp.stemmers import Stemmer
from sumy.utils import get_stop_words

app = Flask(__name__, static_url_path='/static')

app.config.from_object("config.DevConfig")


@app.route("/")
def serve_root():
    return app.send_static_file('index.html')


@app.route("/js/<path:filename>")
def serve_js(filename):
    return send_from_directory('static/js', filename)


@app.route("/theme/<path:filename>")
def serve_css(filename):
    return send_from_directory('static/theme', filename)


@app.route('/summarize', methods=['POST'])
def summarize_part():
    if not request.json or not 'text' in request.json:
        return make_response(jsonify({'error': 'Invalid Input'}), 400)

    print request.json['text']

    sentence_count = app.config['SENTENCE_COUNT'] if request.json['count'] is None else request.json['count']

    # summarize
    summary = summarize(request.json['text'], sentence_count)
    return make_response(jsonify({'summary' : summary}), 200)


def summarize(text, count):
    language = app.config['LANGUAGE']

    parser = PlaintextParser.from_string(text, Tokenizer(language))
    stemmer = Stemmer(language)
    summarizer = Summarizer(stemmer)
    summarizer.stop_words = get_stop_words(language)

    summary = [ sentence.__str__() for sentence in summarizer(parser.document, count)]
    return summary


if __name__ == '__main__':
    app.run()