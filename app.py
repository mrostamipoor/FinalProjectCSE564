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
    
data = pd.read_csv('static/data/GSoDI_v5.1.csv')
data=data.dropna()
data=data[['ID_year','democratic_performance_numeric','C_SD11','C_SD12','C_SD13','C_SD14','C_SD21','C_SD22A','C_SD22B','C_SD22C','C_SD22D','C_SD22E','C_SD23A','C_SD23B','C_SD23C','C_SD31','C_SD32','C_SD33','C_SD41','C_SD42','C_SD51','C_SD52','C_SD53','C_SD54']]
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
print(data.columns)
corr_martrix=data.corr()
corr_martrix.to_csv('static/data/corr.csv', sep=',')
data.to_csv('static/data/newDemo.csv', sep=',')
scaled_data = standardizing_data(data)
labaled_data=data.copy(deep=False)
labaled_data=dokmeans(labaled_data)
labaled_data.rename(columns={'C_SD11':'clean_elections' }, inplace=True)
labaled_data.rename(columns={'C_SD12':'inclusive_suffrage' }, inplace=True)
labaled_data.rename(columns={'C_SD13':'free_political_parties' }, inplace=True)
labaled_data.rename(columns={'C_SD14':'elected_government'}, inplace=True)
labaled_data.rename(columns={'C_SD21':'access_to_justice'}, inplace=True)
labaled_data.rename(columns={'C_SD22A':'freedom_of_expression'}, inplace=True)
labaled_data.rename(columns={'C_SD22B':'freedom_of_association_and_assembly'}, inplace=True)
labaled_data.rename(columns={'C_SD22C':'freedom_of_religion' }, inplace=True)
labaled_data.rename(columns={'C_SD22D':'freedom_of_movement'}, inplace=True)
labaled_data.rename(columns={'C_SD22E':'personal_integrity_and_security2'}, inplace=True)
labaled_data.rename(columns={'C_SD23A':'social_group_equality'}, inplace=True)
labaled_data.rename(columns={'C_SD23B':'basic_welfare'}, inplace=True)
labaled_data.rename(columns={'C_SD23C':'gender_equality'}, inplace=True)
labaled_data.rename(columns={'C_SD31':'effective_parliament'}, inplace=True)
labaled_data.rename(columns={'C_SD32':'judicial_independence'}, inplace=True)
labaled_data.rename(columns={'C_SD33':'media_integrity'}, inplace=True)
labaled_data.rename(columns={'C_SD41':'absence_of_corruption'}, inplace=True)
labaled_data.rename(columns={'C_SD42':'predictable_enforcement'}, inplace=True)
labaled_data.rename(columns={'C_SD51':'civil_society_participation'}, inplace=True)
labaled_data.rename(columns={'C_SD52':'electoral_participation'}, inplace=True)
labaled_data.rename(columns={'C_SD53':'direct_democracy'}, inplace=True)
labaled_data.rename(columns={'C_SD54':'local_democracy'}, inplace=True)

corr_martrix=data.corr()
corr_martrix.to_csv('static/data/data.csv', sep=',')

#for creating graph.json
columnsNamesArr = corr_martrix.columns.values

dic1=[]
i=0
for elem in corr_martrix:
    dictionary_tmp ={}
    dictionary_tmp["id"] = i
    dictionary_tmp["name"]=elem
    dic1.append(dictionary_tmp)
    i=i+1
#print(dic1)    

dic2=[]
i=0
for elem in corr_martrix:
    tmp=corr_martrix[elem]
    j=0
    for indx in tmp: 
        dictionary_tmp ={}
        dictionary_tmp["source"] = i
        dictionary_tmp["target"] = j
        dictionary_tmp["weight"]=indx
        dic2.append(dictionary_tmp)
        j=j+1
    
    i=i+1
#print(dic2)  

dictnew={}
dictnew["nodes"] = dic1
dictnew["edges"] = dic2
#print(dictnew)
r = json.dumps(dictnew)
with open('./static/graph.json','w') as fp:
    json.dump(dictnew, fp)

@app.route('/')
def index():
    return render_template('index.html')


@app.route('/kmeans')
@cross_origin(origin='*',headers=['Content-Type','Authorization'])
def findelbow():

    kmeans_df = data
    wcss = []
    for i in range(1, 14):
        kmeans = KMeans(n_clusters=i,random_state=0)
        kmeans.fit(kmeans_df)
        wcss.append(kmeans.inertia_)
        
    return jsonify(wcss)  
    

def get_MDS_data(dataset,metric_type):
    seed = np.random.RandomState(seed=3)
    mds = MDS(n_components=2, max_iter=3000, eps=1e-9,random_state=seed,dissimilarity="precomputed", n_jobs=1)
    if'euclidean' in metric_type:
        distance_matrix = pairwise_distances(dataset,   metric = metric_type)
    else:
        distance_matrix=1-np.absolute(corr_martrix)
    
    mds_trans = mds.fit_transform(distance_matrix)
    return  mds_trans.tolist()

@app.route('/euclideanMDS')
@cross_origin(origin='*',headers=['Content-Type','Authorization'])    
def euclidean_MDS():
    metric_type =  'euclidean'
    eMDS=get_MDS_data(scaled_data,metric_type)
    l_data=labaled_data['kmeans_label'].tolist()
    return jsonify(eMDS,l_data)
    
@app.route('/correlationMDS')
@cross_origin(origin='*',headers=['Content-Type','Authorization'])    
def correlation_MDS():
    metric_type =  'correlation'
    cMDS=get_MDS_data(scaled_data,metric_type)
    l_data=labaled_data['kmeans_label'].tolist()
    columnsNamesArr = corr_martrix.columns.values.tolist()
    #print(type(cMDS))
    np.savetxt("GFG.csv",  cMDS,
           delimiter =", ", 
           fmt ='% s')
    return jsonify(cMDS,l_data,columnsNamesArr)    

@app.route('/fetchPCPData', methods=['GET'])
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
    return jsonify(l_data)

atrributes = {0:'num_critic_for_reviews',1:'duration'
    ,2:'director_facebook_likes',3:'actor_3_facebook_likes',
    4:'actor_1_facebook_likes',5:'gross',6:'num_voted_users',
    7:'cast_total_facebook_likes',8:'facenumber_in_poster',
    9:'num_user_for_reviews',10:'budget',11:'actor_2_facebook_likes',
    12:'imdb_score',13:'movie_facebook_likes'}
    
@app.route('/fetchSortedPath', methods=['GET'])
@cross_origin(origin='*',headers=['Content-Type','Authorization'])
def sort_path():
    sorted_path=[]
    index=request.args.get("indexes")
    indexes=index.split(".")
    for indx in indexes:
        indx=int(indx)
        sorted_path.append(atrributes[indx])
    newdata = data.reindex(columns=sorted_path)
    l_data=labaled_data['kmeans_label'].tolist()
    newdata["kmeans_label"] = l_data
    newdata.to_csv('static/data/sorted_data.csv', sep=',')
    return jsonify(sorted_path)
       
if __name__ == "__main__":
    app.run(debug=True, port=5000)