#!/bin/bash

# conda deactivate
# conda env remove -n deby-website

# clean up later
conda create -n deby-website python \
    flask flask_cors tqdm \
    numpy scipy bitsandbytes \
    pytorch torchtext pytorch-cuda=12.4 \
    transformers huggingface_hub \
    -c pytorch -c nvidia -c conda-forge

    # numpy scipy matplotlib pandas anaconda::scikit-learn nltk \
    # kagglehub \


# conda create -n deby-website python
# conda activate deby-website

# conda install numpy scipy matplotlib anaconda::scikit-learn nltk

# conda install pytorch torchtext pytorch-cuda=11.8 cudatoolkit=11.8 -c pytorch -c nvidia

# conda install kaggle