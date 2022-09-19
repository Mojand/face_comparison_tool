#!/usr/bin/env python3
# -*- coding: utf-8 -*

from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import pandas as pd
import numpy as np
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt

df = pd.read_csv("/home/csd/Documents/Stage_PJGN/Test/Test_Deepface/listOfMetricsImageQualityWithFaceQnetandRetinaFace.csv", delimiter=';')
df = df.sample(frac=1)

X = df.drop(columns=['fileName', 'predict'], axis=1)

feature_names = [f"feature {i}" for i in range(X.shape[1])]


y = df['predict']

X_train, X_test, y_train, y_test= train_test_split(X,y,test_size= 0.3)

rf = RandomForestClassifier()
rf.fit(X_train,y_train)

importances = rf.feature_importances_
std = np.std([tree.feature_importances_ for tree in rf.estimators_], axis=0)


forest_importances = pd.Series(importances, index=feature_names)


predictions= rf.predict(X_test)

print(confusion_matrix(y_test,predictions))
print('\n')
print(classification_report(y_test,predictions))


fig, ax = plt.subplots()
forest_importances.plot.bar(yerr=std, ax=ax)
ax.set_title("Feature importances using MDI")
ax.set_ylabel("Mean decrease in impurity")
fig.tight_layout()
plt.show()

