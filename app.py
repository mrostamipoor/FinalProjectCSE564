from sklearn.preprocessing import StandardScaler
from flask import Flask, render_template, request, jsonify
from flask_cors import CORS, cross_origin
from sklearn.cluster import KMeans
import pandas as pd
import json
import numpy as np
from sklearn import datasets
from sklearn.preprocessing import StandardScaler
from sklearn.manifold import MDS
from sklearn.metrics import pairwise_distances

app = Flask(__name__)
cors = CORS(app, resources={r"/foo": {"origins": "*"}})
app.config['CORS_HEADERS'] = 'Content-Type'

 
def standardizing_data(IMDB_data):
    X =IMDB_data.values
    scaler = StandardScaler()
    scaler.fit(X)
    X_scaled = scaler.transform(X)
    return X_scaled
def dokmeans(labaled_data):
    kmeans_df = labaled_data
    kmeans = KMeans(n_clusters=3)
    kmeans_df=kmeans.fit(kmeans_df)
    kmeans_label = kmeans_df.labels_
    labaled_data['kmeans_label'] = kmeans_label
    return labaled_data
    
data = pd.read_csv('static/data/newDemo.csv')
'''data = pd.read_csv('static/data/GSoDI_v5.1.csv')
# data=data.dropna()
data=data[['ID_year','democratic_performance_numeric','ID_country_name','C_SD11','C_SD12','C_SD13','C_SD14','C_SD21','C_SD22A','C_SD22B','C_SD22C','C_SD22D','C_SD22E','C_SD23A','C_SD23B','C_SD23C','C_SD31','C_SD32','C_SD33','C_SD41','C_SD42','C_SD51','C_SD52','C_SD53','C_SD54']]
data.rename(columns={'C_SD11':'clean_elections' }, inplace=True)
data.rename(columns={'C_SD12':'inclusive_suffrage' }, inplace=True)
data.rename(columns={'C_SD13':'free_political_parties' }, inplace=True)
data.rename(columns={'C_SD14':'elected_government'}, inplace=True)
data.rename(columns={'C_SD21':'access_to_justice'}, inplace=True)
data.rename(columns={'C_SD22A':'freedom_of_expression'}, inplace=True)
data.rename(columns={'C_SD22B':'freedom_of_association_and_assembly'}, inplace=True)
data.rename(columns={'C_SD22C':'freedom_of_religion' }, inplace=True)
data.rename(columns={'C_SD22D':'freedom_of_movement'}, inplace=True)
data.rename(columns={'C_SD22E':'personal_integrity_and_security2'}, inplace=True)
data.rename(columns={'C_SD23A':'social_group_equality'}, inplace=True)
data.rename(columns={'C_SD23B':'basic_welfare'}, inplace=True)
data.rename(columns={'C_SD23C':'gender_equality'}, inplace=True)
data.rename(columns={'C_SD31':'effective_parliament'}, inplace=True)
data.rename(columns={'C_SD32':'judicial_independence'}, inplace=True)
data.rename(columns={'C_SD33':'media_integrity'}, inplace=True)
data.rename(columns={'C_SD41':'absence_of_corruption'}, inplace=True)
data.rename(columns={'C_SD42':'predictable_enforcement'}, inplace=True)
data.rename(columns={'C_SD51':'civil_society_participation'}, inplace=True)
data.rename(columns={'C_SD52':'electoral_participation'}, inplace=True)
data.rename(columns={'C_SD53':'direct_democracy'}, inplace=True)
data.rename(columns={'C_SD54':'local_democracy'}, inplace=True)
data.rename(columns={'ID_country_name':'country'}, inplace=True)


data.drop(data[data['democratic_performance_numeric'].isnull() ].index, inplace=True)

# fill missing value with mean
features_name = list(data.columns)
for feature in features_name:
    if feature != 'country' and data[feature].isnull().sum() > 0:
        data[feature] = data.groupby('democratic_performance_numeric')[feature].transform(lambda grp: grp.fillna(np.mean(grp)))

#change democratic_performance_numeric (now more is better)
data['democratic_performance_numeric'] = data['democratic_performance_numeric'].apply(lambda x: -x + 6)

print(data.columns)
data.to_csv('static/data/newDemo.csv', index=False, sep=',')'''

#corr_martrix=data.corr()
#corr_martrix.to_csv('static/data/corr.csv', sep=',')

#scaled_data = standardizing_data(data.loc[:, data.columns != 'country'])
#labaled_data=data.copy(deep=False)
#labaled_data=dokmeans(labaled_data.loc[:, labaled_data.columns != 'country'])
#corr_martrix=data.corr()
#corr_martrix.to_csv('static/data/data.csv', sep=',')
#columnsNamesArr = corr_martrix.columns.values


@app.route('/')
def index():
    maplist = [0] * (2021 - 1975)
    for i in range(1975, 2021):
        tmplist = data[data['ID_year'] == i][['country', 'democratic_performance_numeric']].values
        maplist[i - 1975] = np.insert(tmplist, [0], ['Country', 'DemocraticPerformance'], axis = 0).tolist()


    countrylist = np.unique(data['country'].values).tolist()
    attributeslist = data.columns.tolist()
    attributeslist = attributeslist[1:2] + attributeslist[3:]
    final_dict = {}
    for country in countrylist:
        country_dict = {}
        for attr in attributeslist:
            attrvalues = data[data['country'] == country][[attr]].values.reshape(-1).tolist()
            attrlist = []
            for i in range(2021 - len(attrvalues), 2021):
                attrlist.append({"date": f'{i}-01-01', "value": attrvalues[i - (2021 - len(attrvalues))]})
            country_dict[attr] = attrlist
        final_dict[country] = country_dict
    linechartdata = pd.DataFrame(final_dict).to_json(orient="columns")

    pielist = [0] * (2021 - 1975)
    for j in range(1975, 2021):
        count_dict = data[data['ID_year'] == j]['democratic_performance_numeric'].value_counts().to_dict()
        tmp_list = []
        for i in list(count_dict.keys()):
            if i == 5:
                tmp_list.append({"name": "High performing democracy", "value": count_dict[i]})
            elif i == 4:
                tmp_list.append({"name": "Mid-range performing democracy", "value": count_dict[i]})
            if i == 3:
                tmp_list.append({"name": "Weak democracy", "value": count_dict[i]})
            elif i == 2:
                tmp_list.append({"name": "Hybrid Regime", "value": count_dict[i]})
            elif i == 1:
                tmp_list.append({"name": "Authoritarian Regime", "value": count_dict[i]})
        pielist[j - 1975] = tmp_list
    
    return render_template('index.html', mapdata=maplist, linechartdata=linechartdata, countrylist=countrylist, attributeslist=attributeslist, piedata=pielist)

'''@app.route('/fetchPCPData', methods=['GET'])
@cross_origin(origin='*',headers=['Content-Type','Authorization'])

def pcp_data():
    print('test')
    print(labaled_data.columns)
    pcp = labaled_data.to_dict('records')
    temp = pd.read_csv('static/data/newDemo.csv')
    temp = temp.dropna()
    l_data=labaled_data['kmeans_label'].tolist()
    temp["kmeans_label"] = l_data
    temp.to_csv('static/data/labaled_data.csv', sep=',')
    return jsonify(l_data)'''


       
if __name__ == "__main__":
    app.run(debug=True, port=5000)